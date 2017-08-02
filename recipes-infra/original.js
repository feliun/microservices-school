'use strict';

const aws = require('aws-sdk')

var elb, ec2, cloudWatch

initAws(error => {
    if (error) log.error('Could not init AWS: %s', error);
});


function initAws(callback)
{
    aws.config.loadFromPath('./.aws-credentials.json');
    elb = new aws.ELB()
    ec2 = new aws.EC2()
    cloudWatch = new aws.CloudWatch()
    return callback(null)
}

exports.getInstanceIds = function(prefix, callback)
{
    var params = {MaxResults: 1000};
    ec2.describeInstances(params, function(error, instances)
    {
        if (error) return callback(error);
        var instanceArrays = instances.Reservations.map(function(reservation)
        {
            return reservation.Instances.map(function(description)
            {
                if (!description.State || description.State.Name != 'running') return null;
                var name = getName(description.Tags);
                if (!name || !name.startsWith(prefix)) return null;
                return description.InstanceId;
            }).filter(id => id);
        });
        var instanceIds = [].concat.apply([], instanceArrays);
        callback(null, instanceIds);
    })
}

function getName(tags)
{
    return tags.map(function(tag)
    {
        if (tag.Key == 'Name') return tag.Value;
    }).filter(name => name)[0];
}

exports.getCpuUsage = function(instanceId, minutes, callback)
{
    var now = new Date();
    var start = new Date(now.getTime() - minutes * 60 * 1000);
    var params = {
        MetricName: 'CPUUtilization',
        StartTime: start.toISOString(),
        EndTime: now.toISOString(),
        Namespace: 'AWS/EC2',
        Period: 60,
        Statistics: ['Average'],
    };
    if (!callback)
    {
        callback = instanceId;
    }
    else
    {
        params.Dimensions = [{
            Name: 'InstanceId',
            Value: instanceId,
        }];
    }
    cloudWatch.getMetricStatistics(params, function(error, result)
    {
        if (error) return callback(error);
        if (!result.Datapoints.length)
        {
            log.warning('Empty metrics returned %j', result);
            return callback(null, 0);
        }
        var total = 0;
        var statistic = params.Statistics[0];
        result.Datapoints.forEach(function(datapoint)
        {
            total += datapoint[statistic];
        });
        return callback(null, total / result.Datapoints.length);
    });
}

function testCpuUsage(callback)
{
    exports.getInstanceIds('infra', function(error, ids)
    {
        if (error) return testing.failure('Could not get instance ids: %s', error, callback);
        if (!ids || !ids.length) return testing.success('No instances running', callback);
        log.info('Infra ids: %s', ids);
        exports.getCpuUsage(ids[0], 5, function(error, usage)
        {
            if (error) return testing.failure('Could not get CPU usage: %s', error, callback);
            testing.assert(usage, 'No usage', callback);
            return testing.success(callback)
        });
    });
}

exports.createInstance = function(name, callback)
{
    var params = {
        ImageId: 'ami-23706645',
        MinCount: 1,
        MaxCount: 1,
        DisableApiTermination: false,
        EbsOptimized: false,
        InstanceInitiatedShutdownBehavior: 'terminate',
        InstanceType: 't2.micro',
        KeyName: 'infra',
        Monitoring: {Enabled: true},
        Placement: {AvailabilityZone: 'eu-west-1a'},
        BlockDeviceMappings : [{
            DeviceName: '/dev/sda1',
            Ebs: { 'DeleteOnTermination': true}
        }],
        SecurityGroupIds: ['sg-afdde1d6'],
        SubnetId: 'subnet-dc5699bb',
        TagSpecifications: [{
            ResourceType: 'instance',
            Tags: [{
                Key: 'Name',
                Value: name,
            }]
        }],
    };
    ec2.runInstances(params, function(error, data)
    {
        if (error) return callback(error);
        var instanceId = data.Instances[0].InstanceId;
        return callback(null, instanceId);
    });
}

exports.terminateInstance = function(instanceId, callback)
{
    var params = {
        InstanceIds: [instanceId],
    };
    ec2.terminateInstances(params, callback);
}

function testCreateInstance(callback)
{
    exports.createInstance('test', function(error, instanceId)
    {
        if (error) return callback(error);
        exports.terminateInstance(instanceId, callback);
    })
}

exports.sendCustomMetrics = function(metrics, domain, callback)
{
    if (!metrics.countProperties()) return callback(null);
    var params = {
        Namespace: 'infra',
        MetricData: [],
    };
    for (var key in metrics)
    {
        var data = {
            MetricName: key,
            Timestamp: new Date(),
            Unit: 'None',
            Value: metrics[key],
            Dimensions: [{
                Name: 'domain',
                Value: domain,
            }],
        };
        params.MetricData.push(data);
    }
    cloudWatch.putMetricData(params, callback);
}


exports.test = function(callback)
{
    testing.run([
        testCpuUsage,
        testCreateInstance,
    ], 10000, callback)
}

// run tests if invoked directly
if (__filename == process.argv[1])
{
    exports.test(error => {
        if (error) log.error('Tests failed: %s', error);
    });
}
