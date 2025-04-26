pipeline {
    agent any

    environment {
        EC2_IP = '18.211.148.152'
        APP_DIR = 'E-learning' 
        PM2_APP_NAME = 'server1' 
        BRANCH_NAME = 'omar12' 
    }

    stages {
        stage('Deploy to EC2') {
            steps {
                script {
sshagent(['ec2-ssh-key']) {
    sh """
        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_IP} << 'EOF'
        echo "Connected to EC2"
        cd ${APP_DIR}
        echo "Stopping PM2 process..."
        sudo pm2 stop ${PM2_APP_NAME} || true
        echo "Pulling latest code from GitHub..."
        sudo git reset --hard
        sudo git pull origin ${BRANCH_NAME}
        echo "Installing dependencies..."
        sudo npm install
        echo "Restarting PM2 process..."
        sudo pm2 restart ${PM2_APP_NAME}
        echo "Deployment complete!"
EOF
    """
}

                }
            }
        }
    }

    post {
        success {
            echo "Deployment succeeded!"
        }
        failure {
            echo "Deployment failed!"
        }
    }
}
