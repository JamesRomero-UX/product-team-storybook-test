
# user the uncomplete auth0 cli tool (not the deployment cli tool) to setup some basic users and orgs for testing, but sadly it does not allow us to link roles, users the orgs ....
# https://auth0.github.io/auth0-cli/


auth0 users create -n "TestUserA" -e techadmin+TestUserA@risksmart.com --connection "Username-Password-Authentication" --password "Password123!"
auth0 users create -n "TestUserB" -e techadmin+TestUserB@risksmart.com --connection "Username-Password-Authentication" --password "Password123!"
auth0 users create -n "TestUserC" -e techadmin+TestUserC@risksmart.com --connection "Username-Password-Authentication" --password "Password123!"

auth0 orgs create -n testorg1 --display "Test Organization 1" -m "TEST=true"
auth0 orgs create -n testorg2 --display "Test Organization 2" -m "TEST=true"
auth0 orgs create -n testorg3 --display "Test Organization 3" -m "TEST=true"

# create a machine to machine app for the deployment tool (deploy cli tool)
# Need to actionthe following to give access to the tool
# https://auth0.com/docs/deploy-monitor/deploy-cli-tool

# If this is rerun it will create mulktiple apps with the same name, so need to delete the old ones first
auth0 apps create -n deploytoolapp -t m2m --description ""

#  unix permision to execute a file
# chmod +x user_upload.sh