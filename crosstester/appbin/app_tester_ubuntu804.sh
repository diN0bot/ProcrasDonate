#!/bin/bash

# about:config browser.sessionstore.enabled = false
# otherwise always asks to restore session after a kill
# (kill probably does not stop timer...)

# == SETUP ==
# cd Profiles
# git clone git@github.com:diN0bot/ProcrasDonate.git
# create settings file if necessary
# chmod u+x manage.py
# ./manage.py syncdb
#
# /* create 'freshly_made' FF profile */
#
# /* added to freshly_made/prefs.js */
# user_pref("javascript.options.showInConsole", true);
# user_pref("nglayout.debug.disable_xul_cache", true);
# user_pref("browser.dom.window.dump.enabled", true);
# user_pref("javascript.options.strict", true);
# user_pref("extensions.logging.enabled", true);
# user_pref("dom.report_all_js_exceptions", true);
# user_pref("browser.sessionstore.enabled", false);

# == RUN TEST ==
# notes
#
# when start Firefox, need to wait a bit for PID's to settle
# 

cd /home/lucy/.mozilla/firefox
timeslot=`date '+%d_%b_%Y__%H_%M'`
dtime=`date '+%Y_%m_%d_%H_%M_%S'`
echo -e "\n============ ${timeslot} ============" >> tester.log
echo -e "\n============ ${timeslot} ============" >> django_server.log
echo -e "\n============ ${timeslot} ============" >> ff.log

cd ProcrasDonate
git pull
echo -e "\n -> updated repo"

python procrasdonate/ProcrasDonateFFExtn/content/bin/safe_globals.py
python procrasdonate/applib/xpi_builder.py --install
echo -e "\n -> built xpi"

echo 
./manage.py runserver 8282 &> ../django_server.log.tmp &

cd ..
firefox -CreateProfile "install_pd_${timeslot} /home/lucy/.mozilla/firefox/install_pd_${timeslot}"
firefox -P install_pd_${timeslot} &

sleep 6
pid_ff1=`ps aux | grep install_pd_${timeslot} | grep -v grep | awk '{ print $2 }'`
kill $pid_ff1

cp -rf freshly_made/prefs.js install_pd_${timeslot}/
ln -s /home/lucy/.mozilla/firefox/ProcrasDonate/procrasdonate/ProcrasDonateFFExtn install_pd_${timeslot}/extensions/extension@procrasdonate.com 
echo -e " -> created new profile and linked extension"

firefox -P install_pd_${timeslot} >> ff.log &
echo -e "\n -> opened FF after install"
sleep 15
pid_ff2=`ps aux | grep install_pd_${timeslot} | grep -v grep | awk '{ print $2 }'`
kill $pid_ff2

firefox -P install_pd_${timeslot} -jsconsole http://localhost:8282/dev/autotester_test_suite >> ff.log &
echo -e "\n -> opened FF to run autotester"
sleep 15
pid_ff3=`ps aux | grep install_pd_${timeslot} | grep -v grep | awk '{ print $2 }'`
kill $pid_ff3

sleep 2
for pid_rs in `ps aux | grep runserver.8282 | grep -v grep | awk '{ print $2 }'`
do
    kill $pid_rs
done
# append temp log to django_server.log
cat django_server.log.tmp >> django_server.log

# 1121|1261973311|FAIL|auto_test_summary|239/250
R=`echo -e "select message from logs where detail_type='auto_test_summary' order by -datetime limit 1;" | sqlite3 /home/lucy/.mozilla/firefox/install_pd_${timeslot}/procrasdonate.0.sqlite`
echo -e "\n pass/total -> $R"
if [ $R ]
then
    pass=`echo $R | sed 's/\/.*//'`
    total=`echo $R | sed 's/.*\///'`
    fail=$(( $total-$pass ))
    if [ $pass = $total ]
    then
	echo -e "\n            pass equals total: ${pass}, total = ${total}, fail = ${fail}"
	curl "https://procrasdonate.com/crosstester/report/testrun?test_type=ubuntu804_ff35&dtime=${dtime}&is_pass=True&number_fail=${fail}&total=${total}"
    else
	echo -e "\n            pass does not equal total: ${pass}, total = ${total}, fail = ${fail}"
	curl "https://procrasdonate.com/crosstester/report/testrun?test_type=ubuntu804_ff35&dtime=${dtime}&is_pass=False&number_fail=${fail}&total=${total}"
    fi
else
    echo -e "\n            tests didn't run"
    curl "https://procrasdonate.com/crosstester/report/testrun?test_type=ubuntu804_ff35&dtime=${dtime}&is_pass=False"
fi

#1. after install, auto_test_summary should exist
#    --> will compile bugs prevent this from running after an install?
#2. after upgrade or during a regression test, new
#   auto_test_summary should be created.

exit 0
