# 2a5 migration from MongoDB to PostgreSQL

Run from you local workstation:
```bash
./backup.sh myuser supersecretpw cluster0.LOOKTHISUP.mongodb.net dbname collectionname
```
Which will create a file called `backup.json`.

Then execute:
```bash
node sql.mjs
```
...which picks up the backup json and creates an sql file out of it.

Now import the sql to your postgres instance.
