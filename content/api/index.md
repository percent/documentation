Percent provides an API for developers who want to interact with our platform.

## Clients

This is a list of officially supported clients:

* [Percent Browser Client (JavaScript)](https://github.com/percent/percent-browser-client)

## Authentication & Security

Not yet

## API Specification

* [Applications](#get-app)

### GET `/app`

Retrieves current app details by appkey argument or referral domain name.

Request:

```bash
curl http://api.percent.io/app?appkey=TESTAPP2:C7tLp/flbg41M5iyC6Tb02K8yR09zBb266KtiIyVkLs=
```

Response:

``` javascript
{
  "id": "TESTAPP2",
  "name": "Test App2",
  "domain": "tests2.com",
  "default_plan": null,
  "requires_invite": true,
  "development": true,
  "must_agree_terms": true,
  "email_from": "test@percent.io",
  "login_providers": [
    "github"
  ]
}
```

[meta:title]: <> (REST API)
