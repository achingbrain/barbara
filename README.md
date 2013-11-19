# B.A.R.B.A.R.A

Build A Robot Brew A Real Ale

## Setup

A Rasberry Pi, a BeagleBone Black and some Arduinos.

The BeagleBone has two Arduinos attached to it, one monitors the beer temperature, another controls a heater.

![Components](https://raw.github.com/achingbrain/barbara/master/assets/arduinos.jpg)

The primary and secondary fermentation vessels sit inside a [rubber trug](http://www.homebase.co.uk/webapp/wcs/stores/servlet/ProductDisplay?langId=110&storeId=10151&partNumber=466687) surrounded by water. An [aquarium heater](http://www.amazon.co.uk/dp/B003VZ8AUI) sits in the water, along with a [temperature sensor](http://proto-pic.co.uk/temperature-sensor-waterproof-ds18b20/).

The effect is sort of like a beer ban-marie.

![Primary fermentation vessel inside the heater](https://raw.github.com/achingbrain/barbara/master/assets/banmarie.jpg)

The aquarium heater is turned on and off via a [relay](http://proto-pic.co.uk/beefcake-relay-control-kit/) in the plug box controlled by one of the Arduinos.

![Relay inside the plug box](https://raw.github.com/achingbrain/barbara/master/assets/relay.jpg)

## Dependencies

`apt-get install avahi-daemon avahi-utils libavahi-compat-libdnssd-dev couchdb`

