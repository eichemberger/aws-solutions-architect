#!/bin/bash
sudo useradd --no-create-home --shell /bin/false prometheus

sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus

sudo chown prometheus:prometheus /etc/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus

wget "https://github.com/prometheus/prometheus/releases/download/v2.45.1/prometheus-2.45.1.linux-amd64.tar.gz"

tar xvf prometheus-2.45.1.linux-amd64.tar.gz

cd prometheus-2.45.1.linux-amd64 || exit 1

sudo cp prometheus /usr/local/bin
sudo cp promtool /usr/local/bin

sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool

sudo cp -r consoles /etc/prometheus
sudo cp -r console_libraries /etc/prometheus

sudo chown -R prometheus:prometheus /etc/prometheus/consoles
sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries

sudo cp prometheus.yml /etc/prometheus/prometheus.yml

sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml

cat << 'EOF' > /etc/systemd/system/prometheus.service
  [Unit]
  Description=Prometheus
  Wants=network-online.target
  After=network-online.target

  [Service]
  User=prometheus
  Group=prometheus
  Type=simple
  ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles/ \
    --web.console.libraries=/etc/prometheus/console_libraries/

  [Install]
  WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus