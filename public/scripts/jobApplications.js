let jobApplications;
let renderApplicationCards = (applications) => {
    let applicationsContainer = document.querySelector('.applications-container');
    if (applications.length != 0) {
        applicationsContainer.innerHTML = applications
            .map((application) => {
                return `<div class="applications">
                <div>${application.jobid}</div>
                <div class="user-container">
                <img src=${application.userphoto} alt="details" />
                ${application.full_name}
                </div>
                <div>${application.jobrole}</div>
                <div>${application.jobtype}</div>
                <div>${application.email}</div>
                <div>${formatDate(application.startdate)}</div>
                <div class="action-container">
                <a href="./candidateDetails.html?id=${application.userid}"><img src="./images/in_icon.svg" alt="details" /></a>
                <img src="./images/delete_cross.svg" alt="delete" onclick="deleteJobApplicationHandler(${application.id})" />
                </div>
                </div>`;
            })
            .join(' ');
    } else {
        applicationsContainer.innerHTML = 'No Applications Found';
    }
};
let deleteJobApplicationHandler = async (id) => {
    let response = await deleteData('http://localhost:3200/api/jobApplications/' + id);
    if (response.status) {
        setMessage('success', response.message);
    } else {
        setMessage('error', response.message);
    }
};
let onSearchSubmitHandler = async (e) => {
    e.preventDefault();
    let jobApplicationsResults = await getData('http://localhost:3200/api/jobApplications/company/' + getUserId());
    if (jobApplicationsResults.status) {
        let searchResults = jobApplicationsResults.data.filter((application) => application.jobid == e.target.jobId.value);
        renderApplicationCards(searchResults);
    }
};
window.addEventListener('load', async () => {
    let jobApplicationsResults = await getData('http://localhost:3200/api/jobApplications/company/' + getUserId());
    console.log(jobApplicationsResults.data);
    jobApplicationsResults.status ? renderApplicationCards(jobApplicationsResults.data) : console.log('err');
});
