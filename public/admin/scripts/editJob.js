let onFormSubmitHandler = async (e) => {
    e.preventDefault();
    let jobId = new URL(window.location).searchParams.get('id');
    let jobForm = new FormData(e.target);
    let jobFormData = Object.fromEntries(jobForm);
    let jobResults = await updateData('http://localhost:3200/api/jobs/' + jobId, jobFormData);
    if (jobResults.status) {
        window.location.replace(window.location.origin + '/admin/jobs.html');
    } else {
        setErrorMessage(jobResults.message);
    }
};
let renderFormValues = () => {};
window.addEventListener('load', async () => {
    let jobId = new URL(window.location).searchParams.get('id');
    if (jobId != null) {
        let jobResults = await getData('http://localhost:3200/api/jobs/' + jobId);
        if (jobResults.status) {
            let job = jobResults.data[0];
            console.log(job);
            let postJobForm = document.querySelector('.postJobForm');
            postJobForm.jobRole.value = job.jobrole;
            postJobForm.category.value = job.category;
            postJobForm.jobType.value = job.jobtype;
            postJobForm.jobLocation.value = job.joblocation;
            postJobForm.startDate.value = formatDateForInsert(new Date(job.startdate));
            postJobForm.endDate.value = formatDateForInsert(new Date(job.enddate));
            postJobForm.roleOverview.value = job.roleoverview;
            postJobForm.workingFormat.value = job.workingformat;
            postJobForm.keyPoints.value = job.keypoints;
            postJobForm.tags.value = job.tags;
        } else {
            setErrorMessage(jobResults.message);
        }
    }
});
