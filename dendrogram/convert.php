<?php
	$file_path = basename($_FILES["fileToUpload"]["name"]);
	if (substr($file_path, -3, 3) == 'csv') {
    	if (!($fp = fopen($file_path, 'r'))) {
            die("Can't open file...");
        }

        // field array 
        $field_array = fgetcsv(($fp));
        fclose($fp);

        $fp = fopen($file_path, 'r');
        //read csv headers
        $key = fgetcsv($fp);
        // parse csv rows into array
        $json = array();
            while ($row = fgetcsv($fp)) {
            if ($row != false && $row[0]!= NULL && count($row) != 1)
            	$json[] = array_combine($key, $row);
        }
        // release file handle
        fclose($fp);
    }

    $pTot_array = $json[0];
    $corr_temp = [[]];
    for ( $i = 0 ; $i < 102 ; $i ++ ) {
    	for ( $j = 0 ; $j < 102 ; $j ++ ) {
    		$corr_temp[$i][$j] = 0;
    		if ( $i != $j ) {
    			$i_avg = 0;
    			$j_avg = 0;
    			for ( $k = 0 ; $k < 3 ; $k ++ ) {
    				$iIndex = "P Tot".($i + 1)." ".($k + 1);
    				$jIndex = "P Tot".($j + 1)." ".($k + 1);
    				$i_avg += (float)(str_replace(',', '', $pTot_array[$iIndex]));
    				$j_avg += (float)(str_replace(',', '', $pTot_array[$jIndex]));
    			}
    			$i_avg /= 3;
    			$j_avg /= 3;
    			$i_sd = 0;
    			$j_sd = 0;
    			for ( $k = 0 ; $k < 3 ; $k ++ ) {
    				$iIndex = "P Tot".($i + 1)." ".($k + 1);
    				$jIndex = "P Tot".($j + 1)." ".($k + 1);
    				$i_sd += pow((float)(str_replace(',', '', $pTot_array[$iIndex])) - $i_avg, 2);
    				$j_sd += pow((float)(str_replace(',', '', $pTot_array[$jIndex])) - $j_avg, 2);
    				$corr_temp[$i][$j] += ((float)(str_replace(',', '', $pTot_array[$iIndex])) - $i_avg) * ((float)(str_replace(',', '', $pTot_array[$jIndex])) - $j_avg);
    			}
    			$corr_temp[$i][$j] = $corr_temp[$i][$j] / sqrt($i_sd * $j_sd);
    		}
    	}
    }
    $myfile = fopen("correlation.csv", "w");
    $temp_str = " ";
    for ( $i = 0 ; $i < 102 ; $i ++ ) {
    	$temp_str .= ",ZG".($i+1);
    }
    fwrite($myfile, $temp_str);
    fwrite($myfile, "\n");
    for ( $i = 0 ; $i < 102 ; $i ++ ) {
    	$temp_str = "ZG".($i+1);
    	for ( $j = 0 ; $j < 102 ; $j ++ ) {
    		$temp_str .=",".$corr_temp[$i][$j];
    	}
    	fwrite($myfile, $temp_str);
    	fwrite($myfile, "\n");
    }
    fclose($myfile);
?>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="jquery-ui.min.js"></script>
  <script src="jquery.min.js"></script>
</head>
<body>
	<script type="text/javascript">
		$(document).ready(function () {

		})
	</script>
</body>
</html>