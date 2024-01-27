param($emailto='__none__', $emailuser='__none__', $emailpass='__none__', $picPath='__none__') 

$emailSubject = "Friendly Daily Important Dates Reminder"
$emailbody = "See attachment"

$Message = New-Object Net.Mail.MailMessage($emailuser, $emailto, $emailsubject, $emailbody)
$Message.IsBodyHtml = $true
$message.Attachments.Add($picPath)

$SMTPClient = New-Object Net.Mail.SmtpClient("smtp.office365.com", 587)
$SMTPClient.EnableSsl = $true
$SMTPClient.Credentials = New-Object System.Net.NetworkCredential($emailuser, $emailpass);
$SMTPClient.Send($Message)
