# UBUNTU DESKTOP SETUP

1. Connect ssh to ec2 instance.

2. Become the super user after executing the command `sudo -s`

3. Type the following commands to install vncserver:

```
sudo apt-get update
sudo apt-get -y install ubuntu-desktop
sudo apt install -y xfce4 xfce4-goodies
sudo apt install -y tightvncserver
sudo apt-get install gnome-panel gnome-settings-daemon metacity nautilus gnome-terminal
```

4. Type the command vncserver once.

5. Remember the password you use for accessing the vncserver. Kill vncserver by typing the command `vncserver -kill :1`

6. Backup the vnc config files:

```
mv ~/.vnc/xstartup ~/.vnc/xstartup.bak
nano ~/.vnc/xstartup
```

Commands in this file are executed automatically whenever you start or restart the VNC server. We need VNC to start our desktop environment if it's not already started. Add these commands to the file:

```
#!/bin/sh

export XKL_XMODMAP_DISABLE=1
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS

[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid grey

vncconfig -iconic &
gnome-panel &
gnome-settings-daemon &
metacity &
nautilus &
gnome-terminal &
```

To ensure that the VNC server will be able to use this new startup file properly, we'll need to make it executable.

`sudo chmod +x ~/.vnc/xstartup`

7. Now, restart the VNC server.

`vncserver`

You'll see output similar to this:

```
Output
New 'X' desktop is your_hostname:1

Starting applications specified in /home/sammy/.vnc/xstartup
Log file is /home/ubuntu/.vnc/your_hostname:1.log
```

8. Download and install tightvnc to connect remote desktop from [the following link](http://www.tightvnc.com/download.php)

9. Now run tightvnc viewer

10. Add the port no 5901 in your ec2 security group

11. Write your public ip in remote host text box and port no. `publicIp::port`

12. Your desktop in ec2 instance is ready and execute the command vncserver after every restart.

13. Install Firefox:

```
wget http://ftp.mozilla.org/pub/firefox/releases/50.0/linux-$(uname -m)/en-US/firefox-50.0.tar.bz2
tar -xjf firefox-50.0.tar.bz2
sudo mv firefox /opt/
sudo mv /usr/bin/firefox /usr/bin/firefox_old
sudo ln -s /opt/firefox/firefox /usr/bin/firefox
```
