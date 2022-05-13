IMAGE:=divoc/gateway

docker:
	docker build -t $(IMAGE) .