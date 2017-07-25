#!/bin/bash

# your role should contain
# - AmazonEC2ContainerServiceFullAccess
# - AmazonEC2FullAccess


aws ecs create-cluster
aws ecs list-container-instances