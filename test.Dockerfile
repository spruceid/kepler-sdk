FROM rust:latest

RUN git clone https://github.com/spruceid/kepler /kepler

WORKDIR /kepler

COPY . .

RUN cargo build --release

ENTRYPOINT ["./target/release/kepler"]
