FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir jaclang jac-cloud

COPY . /app

EXPOSE 8000

CMD ["jac", "start", "server.jac", "--host", "0.0.0.0", "--port", "8000"]
