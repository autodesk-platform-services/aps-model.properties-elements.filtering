﻿/////////////////////////////////////////////////////////////////////
// Copyright 2022 Autodesk Inc
// Written by Develope Advocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var apsViewer_left;
var aps;

var options = {
  env: 'AutodeskProduction2',
  getAccessToken: getAPSToken,
  api: 'streamingV2'
};

Autodesk.Viewing.Initializer(options, () => {
  apsViewer_left = new Autodesk.Viewing.GuiViewer3D(document.getElementById('apsViewer_left'));
  apsViewer_left.start();
  apsViewer_right = new Autodesk.Viewing.GuiViewer3D(document.getElementById('apsViewer_right'));
  apsViewer_right.start();
   
});


// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
function loadModel(viewer, urn, viewableId ) {

  var documentId = 'urn:' + urn;
  Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

  function onDocumentLoadSuccess(doc) {
    // if a viewableId was specified, load that view, otherwise the default view
    var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
    if (global_queryBuilder.ids.length > 0)
      viewer.loadDocumentNode(doc, viewables, { ids: global_queryBuilder.ids }).then(i => {
        // any additional action here?
        global_queryBuilder.ids =[] //for next query
        
      });
    else
      viewer.loadDocumentNode(doc, viewables).then(i => {
        //try to download aec data to find available levels
        //as Model Properties API data returns properties of object, but 
        //does not provide the available values of each field(column)
        viewer.model.getDocumentNode().
        getDocument().downloadAecModelData(aecdata=>{
          if(aecdata){
              global_queryBuilder.aec_data = aecdata
              const levels = aecdata.levels.map(a=>a.name) 
              global_queryBuilder.filters.find(i=>i.id=='p01bbdcf2').values = levels
           }
           global_queryBuilder.reset()
         })
      });
  }

  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }
}

function getAPSToken(callback) {
  fetch('/api/aps/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}