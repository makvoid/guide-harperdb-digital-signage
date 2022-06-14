# Digital Signage User Interface
User Interface for the Digital Signage system. Designed to be ran on a Raspberry Pi or other small single board computer which polls HarperDB Custom Functions to fetch sign assignment tasks and display them on the connected monitor.

[Article Link](https://www.example.com)

# Installation

## Local Steps
```sh
# Install the required dependencies & package the user interface using ncc
yarn && yarn package
# Copy the package to the Device
scp ui_package.tgz pi@10.0.0.1:/home/pi
```

Optionally, you can package the User Interface on the Device itself versus on your local machine.

## Device Steps
```sh
# Copy the distribution
tar xf ui_package.tgz
# Move to the install location
sudo mv dist /opt/signs-user-interface && chown -R dietpi. /opt/signs-user-interface
# Install the services
sudo cp services/* /usr/lib/systemd/user # (or copy to /usr/lib/systemd/system if needed)
# Reload systemd to load the new services
sudo systemctl daemon-reload
# Install the extra tools required
sudo apt install -y unclutter
# Enable the service so it starts on boot
sudo systemctl enable signs-user-interface-core
# Start the User Interface
sudo systemctl start signs-user-interface-core
```

# Uninstall
```sh
# Stop the User Interface
sudo systemctl stop signs-user-interface-core
# Disable the service so it does not start on boot
sudo systemctl disable signs-user-interface-core
# Remove the services
rm -rf /usr/lib/systemd/user/signs-user-interface*.service # (or from the system directory if installed there)
# Remove the install directory
rm -rf /opt/signs-user-interface
```
