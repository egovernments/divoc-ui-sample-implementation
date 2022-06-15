IMAGE:=divoc/public-app

docker:
	@CERTIFICATE_NAMESPACE="https://divoc.dev/credentials/vaccination/v1" \
	CERTIFICATE_NAMESPACE_V2="https://divoc.dev/credentials/vaccination/v2" \
	CERTIFICATE_CONTROLLER_ID="https://divoc.prod/vaccine" \
	CERTIFICATE_PUBKEY_ID="https://ph.gov.com/i/philippines" \
	CERTIFICATE_DID="did:philippines" \
	docker build -t $(IMAGE) .