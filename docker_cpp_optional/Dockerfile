# Aviation C++ Microservice (Optional)
# For high-performance route calculations

FROM ubuntu:22.04

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libcurl4-openssl-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source files
COPY . .

# Build the application
RUN mkdir -p build && cd build && \
    cmake .. && \
    make -j$(nproc)

# Expose port
EXPOSE 8080

# Run the application
CMD ["./build/aviation_service"]
