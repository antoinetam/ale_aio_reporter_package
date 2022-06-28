
const reporter = require('./aio-tests-log-results');
const aioLogger = require('./aio-tests-logger')
const date = new Date(Date.now())

function getAIOConfig(config, reportError) {
    aioLogger.logStartEnd(" Determining config to use")
    if (config.env.enableReporting != undefined && config.env.enableReporting!='' ) {
        config.env.aioTests.enableReporting = config.env.enableReporting
        aioLogger.log("Overwrite value enableReporting : " + config.env.enableReporting);
    }
    if (config.env.jiraProjectId != undefined && config.env.jiraProjectId !='') {
        config.env.aioTests.jiraProjectId = config.env.jiraProjectId
        aioLogger.log("Overwrite value jiraProjectId : " + config.env.jiraProjectId);
    }
    if (config.env.createNewCycle != undefined && config.env.createNewCycle !='') {
        config.env.aioTests.cycleDetails.createNewCycle = config.env.createNewCycle
        aioLogger.log("Overwrite value createNewCycle : " + config.env.createNewCycle);
    }
    if (config.env.cycleName != undefined && config.env.cycleName !='') {
        if (config.env.cycleName.includes('%Date')) {
            var str = config.env.cycleName
            str = str.replace('%Date', date.toLocaleDateString("fr"))
            config.env.cycleName = str
        }
        config.env.aioTests.cycleDetails.cycleName = config.env.cycleName
        aioLogger.log("Overwrite value cycleName : " + config.env.cycleName);
    }
    if (config.env.cycleKey != undefined && config.env.cycleKey !='') {
        config.env.aioTests.cycleDetails.cycleKey = config.env.cycleKey
        aioLogger.log("Overwrite value cycleKey : " + config.env.cycleKey);
    }
    if (config.env.addNewRun != undefined && config.env.addNewRun !='') {
        config.env.aioTests.addNewRun = config.env.addNewRun
        aioLogger.log("Overwrite value addNewRun : " + config.env.addNewRun);
    }
    if (config.env.addNewRun != undefined && config.env.addNewRun !='') {
        config.env.aioTests.createNewRunForRetries = config.env.createNewRunForRetries
        aioLogger.log("Overwrite value createNewRunForRetries : " + config.env.createNewRunForRetries);
    }
    if (config.env.addAttachmentToFailedCases != undefined && config.env.addAttachmentToFailedCases !='') {
        config.env.aioTests.addAttachmentToFailedCases = config.env.addAttachmentToFailedCases
        aioLogger.log("Overwrite value addAttachmentToFailedCases : " + config.env.addAttachmentToFailedCases);
    }

    if (Object.keys(config).includes('env') && Object.keys(config.env).includes('aioTests') && !!config.env.aioTests.enableReporting) {
        if (!!!config.env.aioTests.jiraProjectId && !!reportError) {
            aioLogger.error("Jira Project Id is mandatory for AIO Tests Reporting.", true);
            return;
        }
        return config.env.aioTests;
    } else {
        if (!!reportError)
            aioLogger.error("AIO Tests reporting is not enabled.  Please set env:{aioTests:{enableReporting:true}}", true);
    }
}

const registerAIOTestsPlugin = (on, config) => {
    on('before:run', () => {
        let aioConfig = getAIOConfig(config, true);
        if (aioConfig) {
            return reporter.getOrCreateCycle(aioConfig).then((data) => {
                if (aioConfig.cycleDetails.cycleKeyToReportTo) {
                    aioLogger.log("Reporting results to cycle : " + aioConfig.cycleDetails.cycleKeyToReportTo);
                } else {
                    aioLogger.error(data);
                }
            })
        }
    });

    on('after:spec', (spec, results) => {
        let aioConfig = getAIOConfig(config);
        if (aioConfig && aioConfig.cycleDetails.cycleKeyToReportTo) {
            return reporter.reportSpecResults(aioConfig, results).then(() => {
                aioLogger.logStartEnd(" Reporting results completed.")
            })
        }
    })
};

module.exports = { registerAIOTestsPlugin }