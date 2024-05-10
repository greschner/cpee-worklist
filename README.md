# Implementation of a process-based Approach for Data Collection and Conformance Checking of Testing Settings

This project is a worklist management system for the CPEE (Cloud Process Execution Engine) in the laboratory domain. It allows users to create, update, and track worklists for tests against SARS-CoV-2.

## Repository Insights

![Alt](https://repobeats.axiom.co/api/embed/1b203ae4a51d46917ea024ca49e87fcaa3253d84.svg "Repobeats analytics image")

## Overview

1. [Backend Service:](backend) Encapsulates the correlator. Mainly communicates with the CPEE.
2. [Cloud Process Execution Engine (CPEE):](https://cpee.org/) Executes and manages the workflow.
3. [Database:](https://hub.docker.com/_/mongo) MongoDB instance that stores all the data.
4. [Lab Bot:](bot) Handles notification and alerting. Can be also utilized for reporting and
monitoring proposes.
5. [Frontend:](frontend) User interface (GUI) for reporting and visualization of the log data.
6. [Logging Service:](logging) Receives all raw log data from various sources and stores them
in the database. Notifies the backend service when a new log has been received.
7. [Reverse Proxy (NGINX):](nginx) Hides backend and frontend service from being accessed directly.
8. [Process Models:](<process models>) Contains the lab process models for the CPEE

## Installation

To install and run the project locally using Docker Compose, follow these steps:

1. Clone the repository: `$ git clone https://github.com/greschner/cpee-worklist.git`
2. Navigate to the project directory: `$ cd cpee-worklist`
3. Fill out the environment variables in the `.env.template` file and rename it to `.env`.
3. Build the Docker images: `$ docker compose build`
4. Start the Docker containers: `$ docker compose up`

## Frontend Usage

#### Access the Frontend at `http://localhost:80`

- Generate reports and analytics to monitor lab performance
- Search after specific well plates and samples to view their log history
- Export log data either in CSV or JSON format
- View open CPEE tasks which are waiting for callback

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository
2. Create a new branch: `$ git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `$ git commit -m "Add your feature description"`
4. Push to the branch: `$ git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
