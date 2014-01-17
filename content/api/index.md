Percent provides an API for developers who want to interact with our platform.

* [Clients](#clients)
* [Authentication & Security](#authentication-security)
* [API Specification](#api-specification)
    * [Applications](#get-app)

## Clients

This is a list of officially supported clients:

* [Percent Browser Client (JavaScript)](https://github.com/percent/percent-browser-client)

## Authentication & Security

Not yet

## API Specification

### GET `/app`

Retrieves current application details by `app-key` argument or referral domain name

Request:

```bash
GET /app?appkey=dinospace:C7tLp/flbg41M5iyC6Tb02K8yR09zBb266KtiIyVkLs=
GET /app/dinospace
GET /app
{
  "referer": "http://dinospace.com"
}
```

Response:

``` javascript
{
  "id": "dinospace",
  "name": "Dinospace App",
  "domain": "dinospace.com",
  "default_plan": null,
  "requires_invite": true,
  "development": true,
  "must_agree_terms": true,
  "email_from": "trex@dinospace.com",
  "login_providers": [
    "github"
  ]
}
```


[meta:title]: <> (REST API)
