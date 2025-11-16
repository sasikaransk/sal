# Event Type Sample Data & Payload Reference

This document shows example values you can enter into the Event Management form and the corresponding API payloads used by `EventTypeAdminService`.

## Form Fields (Component -> Service -> API)
| UI Field | Form Control Name | Type | Create Payload Key | Update Payload Key | Notes |
|----------|-------------------|------|--------------------|--------------------|-------|
| Event name | `eventName` | string (min 3) | `EventName` | `EventName` | Required. Trimmed. |
| Description | `description` | string or null | `Description` | `Description` | Optional. Empty string becomes null. |
| Season preference | `seasonPreference` | string or null | `SeasonPreference` | `SeasonPreference` | Optional. e.g. "Winter", "Summer". |
| Min budget | `minBudget` | number or null | `MinBudget` | `MinBudget` | Optional. Must be >= 0. |
| Max budget | `maxBudget` | number or null | `MaxBudget` | `MaxBudget` | Optional. Must be >= 0 & >= MinBudget. |
| Sort order | `sortOrder` | number | `SortOrder` | `SortOrder` | Required. Non‑negative. Determines listing order. |
| Icon URL | `iconUrl` | string or null | `IconUrl` | `IconUrl` | Optional. Provide a CDN/HTTP URL. |
| Active on platform (checkbox) | `isActive` (only on update) | boolean | (n/a on create) | `IsActive` | Create defaults to true on server; update sends explicit value. |
| Hidden ID | `eventTypeId` | number | (server assigns) | `EventTypeId` | 0 for create; real ID for edit. |

## Example: Creating a New Event Type
Form input example:
```
Event name: Destination Wedding
Description: Multi-day curated wedding experience abroad.
Season preference: Summer
Min budget: 50000
Max budget: 250000
Sort order: 7
Icon URL: https://cdn.example.com/icons/destination-wedding.png
Active: (checked)
```
Generated create payload (POST to `/api/eventtype/create`):
```json
{
  "EventName": "Destination Wedding",
  "Description": "Multi-day curated wedding experience abroad.",
  "SeasonPreference": "Summer",
  "MinBudget": 50000,
  "MaxBudget": 250000,
  "SortOrder": 7,
  "IconUrl": "https://cdn.example.com/icons/destination-wedding.png"
}
```

## Example: Creating a Simple Budget-less Event Type
```
Event name: Elopement
Description: 
Season preference: 
Min budget: (leave blank)
Max budget: (leave blank)
Sort order: 8
Icon URL: 
Active: (checked)
```
Create payload:
```json
{
  "EventName": "Elopement",
  "Description": null,
  "SeasonPreference": null,
  "MinBudget": null,
  "MaxBudget": null,
  "SortOrder": 8,
  "IconUrl": null
}
```

## Example: Updating an Existing Event Type
Suppose existing record has `eventTypeId = 12` and you change budget range.

Updated form values:
```
Event name: Destination Wedding
Description: Multi-day curated wedding experience abroad.
Season preference: Summer
Min budget: 60000
Max budget: 300000
Sort order: 7
Icon URL: https://cdn.example.com/icons/destination-wedding.png
Active: (checked)
```
Update payload (PUT to `/api/eventtype`):
```json
{
  "EventTypeId": 12,
  "EventName": "Destination Wedding",
  "Description": "Multi-day curated wedding experience abroad.",
  "SeasonPreference": "Summer",
  "MinBudget": 60000,
  "MaxBudget": 300000,
  "SortOrder": 7,
  "IconUrl": "https://cdn.example.com/icons/destination-wedding.png",
  "IsActive": true
}
```

## Example Response Objects (After Normalization)
Service normalizes possible backend casing variants to:
```json
{
  "eventTypeId": 12,
  "eventName": "Destination Wedding",
  "description": "Multi-day curated wedding experience abroad.",
  "seasonPreference": "Summer",
  "minBudget": 60000,
  "maxBudget": 300000,
  "sortOrder": 7,
  "iconUrl": "https://cdn.example.com/icons/destination-wedding.png",
  "isActive": true
}
```

## Validation Summary
- Event name: required; length ≥ 3.
- Sort order: required; ≥ 0.
- Budgets: each ≥ 0 if provided. `minBudget ≤ maxBudget` enforced by custom validator.
- Budget fields can both be blank (null) if no range.
- Optional textual fields trimmed; empty becomes `null` on payload.

## Suggested Test Data Set
| Name | Season | Min | Max | Sort | Active | Icon |
|------|--------|-----|-----|------|--------|------|
| Destination Wedding | Summer | 50000 | 250000 | 7 | true | https://cdn.example.com/icons/destination-wedding.png |
| Beach Ceremony | Summer | 10000 | 80000 | 8 | true | https://cdn.example.com/icons/beach-ceremony.png |
| Winter Ball | Winter | 20000 | 120000 | 9 | false | https://cdn.example.com/icons/winter-ball.png |
| Corporate Retreat | Spring | 15000 | 90000 | 10 | true | https://cdn.example.com/icons/corporate-retreat.png |
| Elopement | (null) | (null) | (null) | 11 | true | (null) |

## Common Errors & How to Avoid Them
| Issue | Cause | Fix |
|-------|-------|-----|
| Budget range error | `minBudget > maxBudget` | Lower min or raise max so min ≤ max. |
| Required field error | Missing / short event name | Enter a name with ≥ 3 characters. |
| Sort order error | Negative number | Use 0 or positive integers. |
| Invalid icon | Broken URL | Ensure absolute HTTPS URL that serves an image. |

## Quick Tips
- Leave Min/Max blank if you don’t want to constrain budgets.
- Keep sort order sequential (1,2,3…) for predictable display ordering.
- Use consistent casing for season preferences (e.g., capitalize first letter) for better search results.

---
Update this file if backend contract changes.
