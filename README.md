# Canaritus

"Canary status" -> "Canaritus" - A simple self-hosted uptime status page with which supports automatic uptime checks and allows users to subscribe to notifications on uptime event changes. 

The application uses Google Push Notifications to notify users on those events even though they don't have the webpage open.

This tool needs to be served behind https for the chrome notifications to work.

### Running
List of environment variables and what they're used for: 

- `SERVER_KEY`: The GCM server key, used for the notifications
- `HOST_URL`: The host being being periodically checked (empty disables periodic checks)
- `HOST_CODE`: The host status code to expect (default: 200)

```
npm install
npm start
```

### Attributions
#### Canary Bird Notification Icon 
*Made by [Freepik](http://www.freepik.com) from [www.flaticon.com](http://www.flaticon.com) and is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)*
