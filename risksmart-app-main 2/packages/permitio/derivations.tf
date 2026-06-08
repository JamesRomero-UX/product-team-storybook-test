resource "permitio_role_derivation" "user_group_member_to_contributor_group_Member" {
  role        = permitio_role.member.key
  on_resource = permitio_resource.user_group.key
  to_role     = permitio_role.contributor_group__Member.key
  resource    = permitio_resource.contributor_group.key
  linked_by   = permitio_relation.user_group_contributor_group.key
  depends_on = [
    permitio_role.member,
    permitio_resource.user_group,
    permitio_role.contributor_group__Member,
    permitio_resource.contributor_group,
    permitio_relation.user_group_contributor_group
  ]
}
resource "permitio_role_derivation" "rs_node_Owner_to_rs_node_Owner" {
  role        = permitio_role.Owner.key
  on_resource = permitio_resource.rs_node.key
  to_role     = permitio_role.Owner.key
  resource    = permitio_resource.rs_node.key
  linked_by   = permitio_relation.rs_node_rs_node.key
  depends_on = [
    permitio_role.Owner,
    permitio_resource.rs_node,
    permitio_relation.rs_node_rs_node
  ]
}
resource "permitio_role_derivation" "owner_group_Member_to_rs_node_Owner" {
  role        = permitio_role.owner_group__Member.key
  on_resource = permitio_resource.owner_group.key
  to_role     = permitio_role.Owner.key
  resource    = permitio_resource.rs_node.key
  linked_by   = permitio_relation.rs_node_owner_group.key
  depends_on = [
    permitio_role.owner_group__Member,
    permitio_resource.owner_group,
    permitio_role.Owner,
    permitio_resource.rs_node,
    permitio_relation.rs_node_owner_group
  ]
}
resource "permitio_role_derivation" "rs_node_Reader_to_rs_node_Reader" {
  role        = permitio_role.Reader.key
  on_resource = permitio_resource.rs_node.key
  to_role     = permitio_role.Reader.key
  resource    = permitio_resource.rs_node.key
  linked_by   = permitio_relation.rs_node_rs_node.key
  depends_on = [
    permitio_role.Reader,
    permitio_resource.rs_node,
    permitio_role.Reader,
    permitio_relation.rs_node_rs_node
  ]
}
resource "permitio_role_derivation" "rs_node_Contributor_to_rs_node_Owner" {
  role        = permitio_role.Contributor.key
  on_resource = permitio_resource.rs_node.key
  to_role     = permitio_role.Owner.key
  resource    = permitio_resource.rs_node.key
  linked_by   = permitio_relation.rs_node_rs_node.key
  depends_on = [
    permitio_role.Contributor,
    permitio_resource.rs_node,
    permitio_role.Owner,
    permitio_relation.rs_node_rs_node
  ]
}
resource "permitio_role_derivation" "contributor_group_Member_to_rs_node_Contributor" {
  role        = permitio_role.contributor_group__Member.key
  on_resource = permitio_resource.contributor_group.key
  to_role     = permitio_role.Contributor.key
  resource    = permitio_resource.rs_node.key
  linked_by   = permitio_relation.contributor_group_rs_node.key
  depends_on = [
    permitio_role.contributor_group__Member,
    permitio_resource.contributor_group,
    permitio_role.Contributor,
    permitio_resource.rs_node,
    permitio_relation.contributor_group_rs_node
  ]
}
resource "permitio_role_derivation" "user_group_member_to_owner_group_Member" {
  role        = permitio_role.member.key
  on_resource = permitio_resource.user_group.key
  to_role     = permitio_role.owner_group__Member.key
  resource    = permitio_resource.owner_group.key
  linked_by   = permitio_relation.user_group_owner_group.key
  depends_on = [
    permitio_role.member,
    permitio_resource.user_group,
    permitio_role.owner_group__Member,
    permitio_resource.owner_group,
    permitio_relation.user_group_owner_group
  ]
}
