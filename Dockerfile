# Multi-stage build for ultra-compact Go server container (~25MB)
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY server-go/go.mod server-go/go.sum ./server-go/
RUN cd server-go && go mod download

COPY server-go/ ./server-go/
RUN cd server-go && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/server /app/server

ENV PORT=10000
EXPOSE 10000

CMD ["/app/server"]
