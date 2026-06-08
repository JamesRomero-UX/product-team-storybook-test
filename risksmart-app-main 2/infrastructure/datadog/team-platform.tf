data "datadog_user" "dd_user_jono" {
  filter = "jonathan.ricci@risksmart.com"
}

data "datadog_user" "dd_user_manny" {
  filter = "manny.potter@risksmart.com"
}

resource "datadog_team" "platform_team" {
  name = "Platform"
  handle = "platform"
  description = "Platform Team"
}

resource "datadog_team_membership" "platform_team_jono" {
  team_id = datadog_team.platform_team.id
  user_id = data.datadog_user.dd_user_jono.id
}

resource "datadog_team_membership" "platform_team_manny" {
  team_id = datadog_team.platform_team.id
  user_id = data.datadog_user.dd_user_manny.id
}
