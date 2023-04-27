properties([
    [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', numToKeepStr: '20']],
    disableConcurrentBuilds(),
    pipelineTriggers([[$class: 'GitHubPushTrigger']]),
    parameters([
        credentials(
            credentialType: 'com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl',
            defaultValue: 'e94cc910-d25f-4ce7-984f-4d968183edcc',
            description: '',
            name: 'DOCKERHUB_CREDENTIAL',
            required: true),
        credentials(
            credentialType: 'org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl',
            defaultValue: 'github-commit-status-token',
            description: '',
            name: 'GITHUB_REPO_STATUS_TOKEN_CREDENTIAL',
            required: true),
        credentials(
            credentialType: 'org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl',
            defaultValue: '	github_repo_status_username',
            description: '',
            name: 'GITHUB_REPO_STATUS_USER_CREDENTIAL',
            required: true),
        ]
    )
])


pipeline {
    agent { label 'ec2-2' }
    environment {
      BRANCH_SAFE=env.BRANCH_NAME.replaceAll("\\/", '').replaceAll('origin', '').replaceAll('MDW-', '')
    }
    stages {
        stage('Build') {
            steps {
                script {
                    customStage('\u2780 Build Image(s)') {
                        sh 'docker build --build-arg GIT_COMMIT_HASH=${GIT_COMMIT} -t nanoxmarketplace/agent:builder-${BRANCH_SAFE}-${GIT_COMMIT} -f Dockerfile.builder .'
                        sh 'docker run --name builder nanoxmarketplace/agent:builder-${BRANCH_SAFE}-${GIT_COMMIT} npm run lint:all:ci'
                        sh 'docker cp builder:/app/output .'
                        sh 'docker container stop builder'
                        sh 'docker container rm builder '
                        junit 'output/*.xml'
                    }
                    customStage('\u2781 Build Docker Image') {
                        sh 'docker build --build-arg GIT_COMMIT_HASH=${GIT_COMMIT} -t nanoxmarketplace/agent:${BRANCH_SAFE}-${GIT_COMMIT} .'
                        dockerLogin()
                        sh 'docker push nanoxmarketplace/agent:${BRANCH_SAFE}-${GIT_COMMIT}'
                    }
                    customStage('\u2782 Build Linux Desktop app') {
                        sh 'docker run --name builder nanoxmarketplace/agent:builder-${BRANCH_SAFE}-${GIT_COMMIT} npm run electron:linux'
                        sh 'rm -rf release'
                        sh 'docker cp builder:/app/release .'
                        sh 'docker container stop builder'
                        sh 'docker container rm builder '
                        dir('release') {
                          stash (name: 'linux-app')
                        }
                    }
                    // TODO: fix windows build. For now it gives uncaught exception on launch with sharp module
                    // customStage('\u2783 Build Windows Desktop app') {
                    //     sh 'docker run --name builder nanoxmarketplace/agent:builder-${BRANCH_SAFE}-${GIT_COMMIT} npm run electron:windows:ci'
                    //     sh 'docker cp builder:/app/release .'
                    //     sh 'docker container stop builder'
                    //     sh 'docker container rm builder '
                    //     dir('release') {
                    //       stash (name: 'windows-app')
                    //     }
                    // }
                }
            }
      }
      stage('Save build artifacts') {
        agent { label 'master' }
        steps {
            sh "mkdir -p release/${env.BUILD_NUMBER}"
            dir("release/${env.BUILD_NUMBER}") {
                unstash('linux-app')
                // unstash('windows-app')
            }
        }
      }
    }
}

def dockerLogin(){
    withCredentials([
            usernamePassword(credentialsId: params.DOCKERHUB_CREDENTIAL,
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD')
    ]) {
        sh """echo ${PASSWORD} | docker login --username ${USERNAME} --password-stdin"""
    }
}

def setBuildStatus(String context, String message, String state) {
    if (env.GIT_COMMIT) {
    // add a Github access token as a global 'secret text' credential on Jenkins with the id 'github-commit-status-token'
        try {
            withCredentials([
                string(credentialsId: params.GITHUB_REPO_STATUS_TOKEN_CREDENTIAL,   variable: 'TOKEN'),
                string(credentialsId: params.GITHUB_REPO_STATUS_USER_CREDENTIAL,    variable: 'USER'),
                ]) {
            // 'set -x' for debugging. Don't worry the access token won't be actually logged
            // Also, the sh command actually executed is not properly logged, it will be further escaped when written to the log
                sh """
                    set -x
                    curl \"https://api.github.com/repos/${getOrgName()}/${getRepoName()}/statuses/${env.GIT_COMMIT}\" \
                        -u ${USER}:${TOKEN} \
                        -H \"Content-Type: application/json\" \
                        -X POST \
                        -d \"{\\\"description\\\": \\\"${message}\\\", \\\"state\\\": \\\"${state}\\\", \\\"context\\\": \\\"${context}\\\", \\\"target_url\\\": \\\"${env.BUILD_URL}\\\"}\"
                """
            }
        } catch (Exception err){
            print err
        }
    }
}

def customStage(String context, Closure closure) {
    stage(context){
        timestamps{
            ansiColor('xterm') {
                echo env.STAGE_NAME;
                try {
                    setBuildStatus(context, "In progress...", "pending");
                        closure();
                } catch (Exception err) {
                    setBuildStatus(context, "Failure", "failure");
                    throw err;
                }
                setBuildStatus(context, "Success", "success");
            }
        }
    }

}

def getOrgName() {
    env.GIT_URL ? env.GIT_URL.split(':').last().split('/').first() : ''
}

def getRepoName() {
    env.GIT_URL ? env.GIT_URL.split(':').last().split('/').last() : ''
}
