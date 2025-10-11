# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy files from the repository root into the container
COPY lotto-backend-api/requirements.txt .
COPY lotto_history.csv .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY lotto-backend-api/ .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the uvicorn server when the container launches
CMD ["python", "main.py"]
