# decentralizard

initial setup requires certs and envs:

```
scp -r <user>@x.x.x.x:~/<app>/certs .
scp -r <user>@x.x.x.x:~/<app>/<envs> .

npx next dev
```

{
name: 'categories',
type: 'relationship',
relationTo: 'categories',
hasMany: true,
},
