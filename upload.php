<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



//print_r($_POST);
//print_r($_FILES);

$uploadDir = dirname(__FILE__)."/testuploads/".$_POST['fileName'];

file_put_contents($uploadDir, file_get_contents($_FILES['file']['tmp_name']), FILE_APPEND);

?>
