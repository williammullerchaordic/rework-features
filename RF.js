let asana = require('asana');
let myToken = '0/bc5394b1a0ae9d865f1a51812adf0358';
let client = asana.Client.create().useAccessToken('0/34784122c7fc335cb34435c5682bddee');
client.users.me().then(function(me) {
    let tagId = 22125825955790;//12423733837123 /* id CC:OnSite */;
    return client.tasks.findByTag(tagId);
}).then(function(collection) {
    // Fetch up to 200 tasks, using multiple pages if necessary
    return collection.fetch(1000);
}).then(function(collection){
    console.log(collection.length);
    return collection;
}).filter(function(task) {
    return task.name.indexOf('[QA]') === -1 && task.name.indexOf('[DSN]') === -1 && (task.name.toLocaleLowerCase().indexOf('implementar') > -1 || task.name.toLocaleLowerCase().indexOf('exportar') > -1);
}).then(function(tasks) {
    let tasksExport = tasks.filter(function(task){
        return task.name.toLocaleLowerCase().indexOf('exportar') > -1;
    });
    let subtasksExport = [];
    let index = 0;
    function iterateTasksExport(index){
        return new Promise(function(resolve, reject){
            resolve(client.tasks.subtasks(tasksExport[index].id).then(function(subtasks){
                return subtasks.data;
            }).filter(function(subtasks){
                return subtasks.name.indexOf('QA') === -1 && subtasks.name.indexOf('DSN') === -1;
            }).then(function(subtasksFilter){
                subtasksExport = subtasksExport.concat(subtasksFilter);
                if(index < tasksExport.length-1){
                    return iterateTasksExport(++index);
                }else{
                    return tasks.concat(subtasksExport);
                }
            }));
        });
    }
    return iterateTasksExport(index);
}).then(function(tasksFilter){
    
});