#!/bin/bash

# Bu 'set -e' komutu bu '.sh' dosyasinin calisirken bir hata olmasi durumunda durdurulabilmesi icin.
set -e

# [qsql]; postgresql databasesi olusturmak icin kullaniliyor.
# [-v ON_ERROR_STOP=1]; Database olusturulurken hata durumunda durmasi icin.
# [--username]; Database kullanici adi. Database icin kullanici belirtiyor.
# [--dbname]; Database ismi.
# LINK: https://en.wikipedia.org/wiki/Here_document
# [<<-EOSQL]; Here Document olarak geciyor. ayni << EOF gibi kullaniliyor.
# [CREATE DATABASE <database_name>;]; kodu Database olusturmani sagliyor.
# [CREATE USER <database_username>;]; kodu Database kullanicisi olusturmani sagliyor.
# [WITH ENCRYPTED PASSWORD '<user_password>']; Kullanicinin sifresini olusturuyor.
# [GRANT ALL PRIVILEGES ON DATABASE <database_name> TO <database_username>]; Database'nin butun yetkilerini bu kullaniciya veriyor. Yani Database uzerinde tam yetkiye sahip oluyor ornek: root yetkisi gibi ama Database'nin.
# [EOSQL]; ile de komutlarin sonuna geldigimizi bitiriyoruz. << EOF'nin sonlanmasi icin EOF ile bitmesi gerekiyor ya.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE $POSTGRES_DB;
	CREATE USER $POSTGRES_USER WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';
	GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL