<?php
header("Access-Control-Allow-Origin: *");

$githubUsername = $_GET['username'];
$repoName = $_GET['repo'];

if ($githubUsername && $repoName) {
    $gitpodUrl = "https://gitpod.io/#https://github.com/" . $githubUsername . "/" . $repoName;
    
    $http_response_header = null;  // Reset the variable
    $content = @file_get_contents($gitpodUrl);

    if ($content !== FALSE) {
        echo $content;
    } else {
        echo "Error fetching Gitpod content.";
        error_log("Error fetching Gitpod content. URL: " . $gitpodUrl);
        error_log("HTTP response code: " . $http_response_header[0]);
    }
} else {
    echo "Error: GitHub username or repository name is missing.";
}
?>
