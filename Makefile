IMAGE:=divoc/public-app

docker:
	@CERTIFICATE_NAMESPACE="https://cowin.gov.in/credentials/vaccination/v1" \
	CERTIFICATE_NAMESPACE_V2="https://cowin.gov.in/credentials/vaccination/v2" \
	CERTIFICATE_CONTROLLER_ID="https://cowin.gov.in/" \
	CERTIFICATE_PUBKEY_ID="https://example.com/i/india" \
	CERTIFICATE_DID="did:india" \
	CERTIFICATE_STATUS_VC="false"
	docker build -f Dockerfile -t $(IMAGE) .

vc-docker:
	@CERTIFICATE_STATUS_VC="true" 
	docker build -f VC-Dockerfile -t $(IMAGE) .

