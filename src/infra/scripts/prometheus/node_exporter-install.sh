#!/bin/bash
sudo useradd --no-create-home --shell /bin/false node_exporter

wget "https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz"

tar xvf node_exporter-1.6.1.linux-amd64.tar.gz

cd node_exporter-1.6.1.linux-amd64 || exit 1

sudo cp node_exporter /usr/local/bin

sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter

cat << 'EOF' > /etc/systemd/system/node_exporter.service
  [Unit]
  Description=Node Exporter
  Wants=network-online.target
  After=network-online.target

  [Service]
  User=node_exporter
  Group=node_exporter
  Type=simple
  ExecStart=/usr/local/bin/node_exporter

  [Install]
  WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

