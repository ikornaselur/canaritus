# Canaritus

"Canary status" -> "Canaritus" - A simple self-hosted uptime status page with which supports automatic uptime checks and allows users to subscribe to notifications on uptime event changes. 

The application uses Google Push Notifications to notify users on those events even though they don't have the webpage open.

This tool needs to be served behind https for the chrome notifications to work.

### Configuration
List of environment variables and what they're used for: 

- `PORT`: The port to server the application on (default: 3000)
- `SERVER_KEY`: The GCM server key, used for the notifications
- `HOST_YAML`: The yaml hosts file (default: hosts.yaml)

#### Automatic hosts uptime checks
You need to configure what hosts to do automatic uptime checks on. See the `hosts.example.yaml` file to see how it's structured. The default configuration file should be called `hosts.yaml`

### Running


Fill in the hosts you want to monitor in hosts.yaml

```
cp hosts.example.yaml hosts.yaml
$EDITOR hosts.yaml
```

Install the dependencies and start the app!

```
npm install
SERVER_KEY=<YOUR_GCM_KEY_HERE> npm start
```

### Attributions
#### Canary Bird Notification Icon 
*Made by [Freepik](http://www.freepik.com) from [www.flaticon.com](http://www.flaticon.com) and is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)*
