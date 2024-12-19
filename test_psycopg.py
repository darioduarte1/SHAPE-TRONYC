import ctypes
import os

# Define rutas de las DLL manualmente
dll_paths = [
    r"C:\Program Files\PostgreSQL\17\bin",
    r"C:\Program Files\PostgreSQL\17\lib",
    r"C:\Windows\System32"
]

# Agregar directorios al PATH dinámicamente
for path in dll_paths:
    try:
        os.add_dll_directory(path)
        print(f"Added DLL directory: {path}")
    except Exception as e:
        print(f"Failed to add DLL directory {path}: {e}")

# Intenta cargar libpq.dll directamente
try:
    ctypes.windll.LoadLibrary("libpq.dll")
    print("libpq.dll loaded successfully!")
except Exception as e:
    print(f"Failed to load libpq.dll: {e}")

# Ahora intenta importar psycopg
try:
    import psycopg
    print("psycopg imported successfully!")
except ImportError as e:
    print(f"Failed to import psycopg: {e}")
