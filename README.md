# Replicates the issue where grandchild relationship does not sync properly when creating new db records

### some info
- https://github.com/toluaina/pgsync@cf82dacc7b6c0ff04b93087243725deeb31baf8a
  - this is the commit hash of the pgsync that P1 is using
- when manually re-indexing the db, the grandchild relationship do get synced properly
  - when creating new records via application, the grandchild data is not synced properly and is getting saved as [null, null]

## Description
This is a bare-bones app setup with opensearch and pgsync. The goal is to replicate or investigate the issue in P1 about grandchild relationships not saved properly in pgsync.

This has a simplified application logic about Students, Courses, and Subjects.
After performing the setup, to replicate the issue in P1 do the following steps.
1. Create a course (there are pre-filled values for convenience)
> when creating a course, there is a "Base subject" and another input for a "Secondary subject", this is to replicate P1's custom document "Base Document" and "Custom Document"
2. Create a student (there are pre-filled values for convenience)
> When creating a student, you select which Course this student record is connected with, this is to replicate P1's action of creating a new custom document based on the selected custom document
3. View the synced data in opensearch dashboards
> specifically the "subjects" grandchild, whether there is proper data or null, that is the issue
4. when you want to test another setup, you can start from step#3 of ##Setup

<details>
<summary>Confirm Fix is Working</summary>
  
  [confirm fix is working.webm](https://github.com/user-attachments/assets/aa300e01-21f1-4593-b0ec-091b2ef5340b)
  
</details>

## Replicating the issue
1. The most plausible cause of the issue why there are saved `[null, null]` records in the grandchild table can be found in `server/prisma/migrations/20250828111439_remove_and_restore_replica/migration.sql`
2. Comment the whole file or only line#2, then start again from step#3 of ##Setup to reset db and pgsync
3. Perform the same steps from ##Description
4. In opensearch dashboards, the saved data is `[null, null]`

<details>
<summary>Confirm Issue about [null, null] in grandchild</summary>
  
  [confirm issue.webm](https://github.com/user-attachments/assets/586fe269-8b17-47b2-aa2b-5a42b1aa8cde)
  
</details>

## Setup
1. in root, run `yarn install` and `yarn setup`
> yarn setup does yarn install for both server and web application
2. run `docker compose up -d` to setup docker containers
3. run `yarn db:reset`
> wipes and recreates the tables, seeds the database, and generates the prisma types
4. run `yarn pgsync:recreate`
> wipes and re indexes the pgsync schema
5. run `yarn dev` to launch the server and web apps
6. check the application in `http://localhost:5173/`
7. check the opensearch dashboards in `http://localhost:5601/app/dev_tools#/console`
> in dev tools console, use this query, the goal is to view the synced data in `subjects` the grandchild data
```
GET /students/_search
{
  "track_total_hits": true
}
```
