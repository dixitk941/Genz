
function startGitpodWorkspace() {
    var githubUsername = prompt("Enter GitHub Username:");
    var repoName = prompt("Enter Repository Name:");

    if (githubUsername && repoName) {
        var apiUrl = `https://gitpod.io/api/start/${githubUsername}/${repoName}`;
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `gitpod_pat_YxNvZa3OsMCMDNLGDAUZxCc1R_Ii6YMMVeRj6bwQYwQ.6flBu5Wig4gA2wEAXHGWnfDPnbpPhhss3cQiW8eA`, // Use your Gitpod API token here
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to start Gitpod workspace');
            }
            return response.json();
        })
        .then(data => {
            if (data.url) {
                window.open(data.url, '_blank');
            } else {
                throw new Error('Gitpod URL not available');
            }
        })
        .catch(error => {
            console.error("Error starting Gitpod workspace:", error);
            alert("Error starting Gitpod workspace. Please try again.");
        });
    } else {
        alert("Please enter GitHub Username and Repository Name.");
    }
}
