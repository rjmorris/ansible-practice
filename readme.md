The purpose of this project is for me to learn ansible by deploying a node.js web application to a Digital Ocean droplet. The primary steps in the deployment will be:

- Create a non-root user.
  - Can log in via SSH key.
  - Has sudo access.
- Install nginx
- Install node.js along with pm2, bower, and gulp
- Start a simple web application

I would like to perform these steps using ansible as much as possible, minimizing the number of non-ansible tasks required.

These notes assume that your SSH private key is accessible to a local instance of `ssh-agent`.

# Create a Digital Ocean droplet

Choose the following when setting it up:

- Ubuntu 16.04 64-bit
- add your own SSH key for the root account

You should be able to connect to the droplet with `ssh root@12.34.56.78`.

# Install and configure ansible locally

```
sudo apt install libffi-dev
conda create -n ansible-testing python=2.7
source activate ansible-testing
pip install ansible
pip install passlib
```

# Python 2 vs. Python 3

Historically, ansible required Python 2 to be installed on both the controller and the host machines. Recent versions have begun adding support for Python 3, although it's possible that some parts may not be compatible yet.

For the controlling machine, the ansible installation instructions above install Python 2.7, so Python 3 isn't really concern there.

For the hosts, Python 2 isn't installed by default on Ubuntu 16.04. Options to address this include:

- Create Ubuntu 14.04 hosts, where Python 2 is installed by default.
- Install Python 2 on the hosts manually with `apt install -y python-minimal`.
- Install Python 2 on the hosts using ansible with methods described at [https://gist.github.com/gwillem/4ba393dceb55e5ae276a87300f6b8e6f].
- Enabling ansible's Python 3 support on the hosts by setting `ansible_python_interpreter=/usr/bin/python3` in the `group_vars`.

For this project, I'm trying out the Python 3 support but will switch to one of the Python 2 methods if necessary.

# Run ansible

All ansible files are in the `deployment` subdirectory. Change into that directory to run any of the ansible playbooks.

Several ansible playbooks are provided for deploying the application. `setup.yml` should be run first, immediately after creating a fresh droplet. The others may be run as needed.

## Playbooks

### `setup.yml`

The only account on a newly-created Digital Ocean droplet is root. The purpose of `setup.yml` is to add a non-root user and to disable root's SSH access. Once `setup.yml` has been run successfully, it cannot be run again, because doing so requires SSH access for root. Afterwards, all playbooks should be run as a non-root admin user.

```
ansible-playbook setup.yml --ask-vault-pass
```

It will prompt for the admin user's username, password, and SSH public key filename. You may instead pass these on the command line by running the command as:

```
ansible-playbook setup.yml --ask-vault-pass --extra-vars="admin_user_username=alice admin_user_public_key=path/to/id_rsa.pub"
```

The admin user will be required to change the password upon logging in for the first time.

### `add_admin.yml`

Use `add_admin.yml` to create additional admin accounts. Like `setup.yml`, you will be prompted for the admin user's username, password, and SSH public key filename.

```
ansible-playbook add_admin.yml --ask-vault-pass --ask-become-pass
```

### `delete_admin.yml`

Use `delete_admin.yml` to delete an admin account. You will be prompted for the admin's username.

```
ansible-playbook delete_admin.yml --ask-vault-pass --ask-become-pass
```

### `deploy.yml`

`deploy.yml` handles all the rest of the deployment tasks such as installing software, copying the application code, and starting the server.

```
ansible-playbook deploy.yml --ask-vault-pass --ask-become-pass
```

To run just one or more roles, specify a tag. Available tags may be found in `deploy.yml`.

```
ansible-playbook deploy.yml --ask-vault-pass --ask-become-pass --tags nodejs
ansible-playbook deploy.yml --ask-vault-pass --ask-become-pass --tags nodejs,nginx
```

## Vault

Sensitive information like passwords is stored using ansible vault. The commands above instruct ansible to prompt you for the vault password, but instead you can store it in a file and run the command as:

```
ansible-playbook deploy.yml --vault-password-file=.vault-password --ask-become-pass
```

The git repo is set up to ignore files named .vault-password, so that's a good place to store it. Be sure to set its permissions to 600.
