resource "permitio_relation" "user_group_contributor_group" {
  key              = "parent"
  name             = "parent"
  subject_resource = permitio_resource.user_group.key
  object_resource  = permitio_resource.contributor_group.key
  depends_on = [
    permitio_resource.contributor_group,
    permitio_resource.user_group,
  ]
}
resource "permitio_relation" "rs_node_rs_node" {
  key              = "rs_parent"
  name             = "rs_parent"
  subject_resource = permitio_resource.rs_node.key
  object_resource  = permitio_resource.rs_node.key
  depends_on = [
    permitio_resource.rs_node,
    permitio_resource.rs_node,
  ]
}
resource "permitio_relation" "contributor_group_rs_node" {
  key              = "contributor"
  name             = "contributor"
  subject_resource = permitio_resource.contributor_group.key
  object_resource  = permitio_resource.rs_node.key
  depends_on = [
    permitio_resource.rs_node,
    permitio_resource.contributor_group,
  ]
}
resource "permitio_relation" "rs_node_owner_group" {
  key              = "owner"
  name             = "owner"
  subject_resource = permitio_resource.owner_group.key
  object_resource  = permitio_resource.rs_node.key
  depends_on = [
    permitio_resource.rs_node,
    permitio_resource.owner_group,
  ]
}
resource "permitio_relation" "user_group_owner_group" {
  key              = "parent"
  name             = "parent"
  subject_resource = permitio_resource.user_group.key
  object_resource  = permitio_resource.owner_group.key
  depends_on = [
    permitio_resource.owner_group,
    permitio_resource.user_group,
  ]
}
