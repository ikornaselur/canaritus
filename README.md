# Canaritus ![status](https://codeship.com/projects/63a924d0-6961-0133-5ef7-666650db048e/status?branch=master)

"Canary status" -> "Canaritus" - A simple self-hosted uptime status page with which supports automatic uptime checks and allows users to subscribe to notifications on uptime event changes. 

The application different services to notify the user about status changes, including: 
- Google Push Notifications to notify users on those events even though they don't have the webpage open
- Email notifications using [Mailgun](https://www.mailgun.com)

## Future goals

The plan is that the tool will be a status page for the web site, showing uptime stats for the web pages/services being monitored with a history of the event that have happened. The tool will support both automatic and manual events.

## Configuration

### Automatic hosts uptime checks
You need to configure what hosts to do automatic uptime checks on. See the `config.example.yaml` file to see how it's structured. The default configuration file should be called `config.yaml`

### Google Cloud Messaging
You need to register a GCM app and add the `server_key` and `project_number` to `config.yaml`

### Mailgun
You need to sign up on [mailgun](https://www.mailgun.com) and add the `api_key`, `domain` and `from` email address to `config.yaml`

## Running

Fill in the hosts you want to monitor in config.yaml

```
cp config.example.yaml config.yaml
$EDITOR config.yaml
```

Install the dependencies and start the app!

```
npm install
npm start
```

### Development
During development, it's useful to use the `:watch` node scripts. 

```
npm run build:watch  # Build the app on changes
npm run server:watch  # Reload the server on changes
```
