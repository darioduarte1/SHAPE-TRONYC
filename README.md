# SHAPE-TRONYC


## Archivos importantes en la raíz
- `requirements.txt`: Dependencias de Python.
- `package.json` y `package-lock.json`: Dependencias de Node.js.

## Ejecutar Pylint
./scripts/run_pylint.sh

# Base de Datos
## Conectar con la base de datos
psql -h autorack.proxy.rlwy.net -p 58523 -U postgres -d railway
## Iniciar server de Backend con protocolos HTTPS
python manage.py runserver_plus --cert-file certs/localhost-cert.pem --key-file certs/localhost-key.pem
## Crear un Super User
python manage.py createsuperuser

# Geral
## Actualizar os requirements
pip freeze > requirements.txt  
## Activar el entorno Virtual en BASH
source venv/Scripts/activate