# homebridge-struct-rgb

An homebridge plugin that controls DIY LED controllers.
It sends a packet via TCP to specified device. The packet is 3 constructive unsigned short (2-byte) ints, big endian. The ints represent 3 channels - red, green and blue, in this order.

# Configuration

Look into `config-sample.json` file.

