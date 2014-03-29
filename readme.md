##Recommendations for Vanni

Pull this back in to your repo.

When you go to digital ocean, destroy your droplet.  Start a new one, choose the smallest size, then when you choose the OS, select the application tabs and select the MEAN ubuntu 12.04 droplet.

When you ssh to that machine, install git.  Run 'sudo apt-get install git-core'

Then install postgres using the instructions on my blog hoganmaps.com

Now you can push your data up to that database from your local machine, i would recommend pgshploader from the OpenGeo suite.

Then, clone this repo up to that machine.  change directories into the kzone folder you pull down via git, and type 'npm install'

That command looks at the package.json file i added and installs all dependencies.  

Install the forever app 'npm install forever -g'

Test and debug with 'node app.js'

Run permanently with 'forever start app.js'

Delete this file and update with the documentation and information about your project.

Great work, this looks fantastic.