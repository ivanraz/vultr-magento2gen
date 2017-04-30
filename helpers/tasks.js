const SSH = require('simple-ssh');

module.exports = {

  InstallMagento: function (ip, password) {

    const server = {
      host: ip,
      user: 'root',
      pass: password
    };

    const ssh = new SSH({
      host: server.host,
      user: server.user,
      pass: server.pass
    });

    ssh
      .exec('DEBIAN_FRONTEND=noninteractive LC_ALL=en_US.UTF-8 add-apt-repository -y ppa:ondrej/php', { out: console.log.bind(console) })
      .exec('apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E5267A6C', { out: console.log.bind(console) })
      .exec('apt-get update', { out: console.log.bind(console) })
      .exec('apt-get install -y apache2 php7.0-cli php7.0-common php7.0-json php7.0-opcache php7.0-mysql php7.0-gd php7.0-imap php7.0-ldap php7.0-dev php7.0-intl php7.0-curl php7.0-mbstring libapache2-mod-php7.0 php7.0-zip php7.0-mcrypt php7.0-bcmath php7.0-imagick php7.0-dom php7.0-redis redis-server', { out: console.log.bind(console) })
      .exec('DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server-5.7', { out: console.log.bind(console) })
      .exec('mysql -u root -e "create database magento;"', { out: console.log.bind(console) })
      .exec('mysql -u root -e "GRANT ALL PRIVILEGES ON magento.* TO \'magento\'@\'localhost\' IDENTIFIED BY \'qwaszx1234\';"', { out: console.log.bind(console) })
      .exec('php -r "copy(\'https://getcomposer.org/installer\', \'composer-setup.php\');" && php composer-setup.php --install-dir=/usr/bin/ --filename=composer && chmod 777 /usr/bin/composer', { out: console.log.bind(console) })
      .exec('mkdir -p /home/magento', { out: console.log.bind(console) })
      .exec('mkdir -p /var/www/m2', { out: console.log.bind(console) })
      .exec('useradd magento -d /home/magento -s /bin/bash', { out: console.log.bind(console) })
      .exec('chown magento:magento /var/www/m2 && chown magento:magento /home/magento', { out: console.log.bind(console) })
      .exec('wget https://files.magerun.net/n98-magerun2.phar && mv n98-magerun2.phar /usr/bin/n98-magerun2 && chmod 777 /usr/bin/n98-magerun2', { out: console.log.bind(console) })
      .exec('sed -i "s/export APACHE_RUN_USER=www-data/export APACHE_RUN_USER=magento/g" /etc/apache2/envvars', { out: console.log.bind(console) })
      .exec('sed -i "s/export APACHE_RUN_GROUP=www-data/export APACHE_RUN_GROUP=magento/g" /etc/apache2/envvars', { out: console.log.bind(console) })
      .exec('wget -O /etc/apache2/sites-available/magento.conf http://raz:LP7a7kyx1hVj@tmp.mystore.today/apache.conf', { out: console.log.bind(console) })
      .exec(`sed -i "s/{servername}/${server.host}/g" /etc/apache2/sites-available/magento.conf`, { out: console.log.bind(console) })
      .exec('a2enmod proxy_fcgi setenvif rewrite vhost_alias header expires', { out: console.log.bind(console) })
      .exec('a2dissite 000-default && rm /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/default-ssl.conf && a2ensite magento', { out: console.log.bind(console) })
      .exec('service apache2 restart', { out: console.log.bind(console) })
      .exec('echo "magento:qwaszx1337" | chpasswd', { out: console.log.bind(console) })
      .exec('exit 100', {
        exit: code => {
          if (code == '100') {

            let ssh = new SSH({
              host: server.host,
              user: 'magento',
              pass: 'qwaszx1337'
            });

            ssh
              .exec('echo "php /usr/bin/composer create-project --repository-url=https://62ee4749ca30881cf825db961a051dcf:6b795b58ef79e320616b4e350f6155f0@repo.magento.com/ magento/project-community-edition /var/www/m2/src" > installMagento.sh', { out: console.log.bind(console) })
              .exec('bash installMagento.sh', { out: console.log.bind(console.Console), err:  console.log.bind('err:', console.Console)})
              .exec(`php /var/www/m2/src/bin/magento setup:install --base-url="http://${server.host}" --db-host="localhost" --db-name=magento --db-user="magento" --db-password="qwaszx1234" --admin-firstname="studioraz" --admin-lastname="studioraz" --admin-email="dev@studioraz.co.il" --admin-user="studioraz" --admin-password="!studioraZ2015" --language="en_US"`, { out: console.log.bind(console.Console), err:  console.log.bind('err:', console.Console)})
              .exec('mkdir /home/magento/.composer', { out: console.log.bind(console) })
              .exec('echo \'{ "http-basic": { "repo.magento.com": { "username": "62ee4749ca30881cf825db961a051dcf", "password": "6b795b58ef79e320616b4e350f6155f0" } } }\' > /home/magento/.composer/auth.json', { out: console.log.bind(console) })
              .on('error', function(err) {
                console.log('error:', err);
                ssh.end()
              })
              .start();

          }
        }
      })
      .on('error', function(err) {
        console.log('error:', err);
        ssh.end()
      })
      .start();
  }


};