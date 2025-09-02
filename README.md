## Issue with grandchild relationships
this is a standalone docker setup to show an issue with pgsync grandchild relationship
when creating new records, grandchild relationship are being saved as [null, null]

### steps
- docker compose build pgsync
- docker compose up -d
- then wait for these 2 containers to show success message
- docker logs mre_inserter --tail=200
- docker logs mre_inserter_2 --tail=200

then in opensearch dashboards, you can use these queries to view the available index
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