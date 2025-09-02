## Issue with grandchild relationships
this is a standalone docker setup to show an issue with pgsync grandchild relationship
when creating new records, grandchild relationship are being saved as [null, null]

### steps
- make the sh files executable 
  - `chmod +x db/inserter.sh`
  - `chmod +x db/inserter_2.sh`
  - `chmod +x entrypoint-pgsync.sh`
- docker compose build pgsync
  - you may need to do `pip install --upgrade pip` once
- docker compose up -d
- then wait for these 2 containers to show success message
- docker logs mre_inserter --tail=200
- docker logs mre_inserter_2 --tail=200
  - you may end up needing to adjust the sleep time in `inserter.sh` and `inserter_2.sh` to allow for longer waits
  - just make sure that `inserter_2.sh` waits longer that `inserter.sh`

then in [opensearch dashboards](http://localhost:5601/app/dev_tools#/console), you can use these queries to view the available index
```

GET /students/_search
{
  "track_total_hits": true,
  "sort": [
    {
      "id": {
        "order": "desc"
      }
    }
  ]
}

GET /students/_search
{
   "query": {
    "bool": {
      "must_not": {
        "exists": { "field": "course.subjects.id" }
      }
    }
  },
  "track_total_hits": true,
  "sort": [
    {
      "id": {
        "order": "desc"
      }
    }
  ]
}

GET /students/_search
{
  "query": {
    "exists": { "field": "course.subjects.id" }
  },
  "track_total_hits": true,
  "sort": [
    {
      "id": {
        "order": "desc"
      }
    }
  ]
}
```

### retrying steps
- docker compose down -v
- docker compose build --no-cache pgsync
- docker compose up -d --build --force-recreate
