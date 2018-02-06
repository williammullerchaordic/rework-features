const fs = require('fs');
const asana = require('asana');
const myToken = '0/bc5394b1a0ae9d865f1a51812adf0358';
const client = asana.Client.create().useAccessToken('0/34784122c7fc335cb34435c5682bddee');
const csvExport = require('csv-export');
client.users.me().then(function(me) {
    /* 22125825955790 id INT; 12423733837123 id CC:OnSite */
    let tagId = 22125825955790;
    return client.tasks.findByTag(tagId);
}).then(function(collection) {
    // Fetch up to 200 tasks, using multiple pages if necessary
    return collection.fetch(2000);
}).then(function(collection){
    console.log(collection.length);
    return collection;
}).filter(function(task) {
    return task.name.indexOf('[QA]') === -1 && task.name.indexOf('[DSN]') === -1 && task.name.indexOf('[TAM]') === -1/*  && (task.name.toLocaleLowerCase().indexOf('implementar') > -1 || task.name.toLocaleLowerCase().indexOf('exportar') > -1) */;
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

}).filter(function(tasksFilter){
    return tasksFilter.name.indexOf('funcionalidades v2.0') === -1 && 
        tasksFilter.name.indexOf('?') === -1 && 
        tasksFilter.name.indexOf('Exportar Layout Busca v2.0') === -1 &&
        tasksFilter.name.indexOf('robots.txt') === -1 &&
        tasksFilter.name.indexOf('Importar dados') === -1 &&
        tasksFilter.name.indexOf('Solicitar') === -1 &&
        tasksFilter.name.indexOf('Validar') === -1 &&
        tasksFilter.name.indexOf('Subir/Configurar') === -1 &&
        tasksFilter.name.indexOf('Garantir') === -1 &&
        tasksFilter.name.indexOf('IMPLEMENTAR LAZY LOAD') === -1 &&
        tasksFilter.name.toLocaleLowerCase().indexOf('rodada de ajustes') === -1 &&
        tasksFilter.name.toLocaleLowerCase().indexOf('módulo vtex') === -1 &&
        tasksFilter.name.toLocaleLowerCase().indexOf('exportar vitrines') === -1 &&
        tasksFilter.name.toLocaleLowerCase().indexOf('codereview') === -1 &&
        tasksFilter.name.toLocaleLowerCase().indexOf('code review') === -1;
}).then(function(tasksFilter){
    blackWordsMap = {
        "a": "a",
        "e": "e",
        "o": "o",
        "os": "os",
        "com": "com",
        "no": "no",
        "do": "do",
        "na": "na",
        "dos": "dos",
        "de": "de",
        "das": "das",
        "nas": "nas"
    };

    var matchWordsIncidence = [];

    var allWords = {};

    for(var i = 0; i < tasksFilter.length; i++){
        var arrWordsTaskName = tasksFilter[i].name.split(" ");
        for(var j = 0; j < arrWordsTaskName.length; j++){
            var word = arrWordsTaskName[j];
            if(!blackWordsMap[word]){
                if(allWords[word]){
                    allWords[word].ids.push(tasksFilter[i].id);
                }else{
                    allWords[word] = {ids: [tasksFilter[i].id]};
                }
            }
        }
    }

    for(word in allWords){
        console.log(allWords[word].ids.join("| ").replace(/ /g, ''));
        matchWordsIncidence.push({
            "word": word,
            ids: allWords[word].ids.join("| ").replace(/ /g, '')
        });
        if(matchWordsIncidence.length > 1){
            var indexLastPushed = matchWordsIncidence.length-1;
            for(var i = matchWordsIncidence.length-1; i >= 0; i--){
                if(matchWordsIncidence[indexLastPushed]['ids'].length > matchWordsIncidence[i]['ids'].length){
                    var aux = matchWordsIncidence[i];
                    matchWordsIncidence[i] = matchWordsIncidence[indexLastPushed];
                    matchWordsIncidence[indexLastPushed] = aux;
                    indexLastPushed = i;
                }
            }
        }
    }

    return matchWordsIncidence;
}).then(function(matchWordsIncidence){
    csvExport.export(matchWordsIncidence,function(buffer){
        fs.writeFileSync('./matchWordsIncidence-22125825955790.zip',buffer);
    });

    /* csvExport.export(tasksFilter,function(buffer){
        fs.writeFileSync('./data.zip',buffer);
    }); */
});