# This script automates the process of mining
import requests
import time
import sys
import threading
import itertools
import os

transactionPool_URL = "http://localhost:3000/api/transaction-pool-map"
mineTransactions_URL = "http://localhost:3000/api/mine-transactions"

done = False
stop = False

def clearScr():
	if os.name == 'posix':
		os.system('clear')
		return
	
	os.system('cls')



def loadingAnim():
		  for c in itertools.cycle(['|', '/', '-', '\\']):
					if done:
							  break
					sys.stdout.write('\r[+] Mining ' + c)
					sys.stdout.flush()
					time.sleep(0.1)
		  sys.stdout.write('\r[+] Done!    ')



def tryingAgain():
		print("[ERR] Error fetching transaction pool. The node may be down...")

		for c in itertools.cycle(['.', '..', '...']):
			if stop:
				break
			sys.stdout.write('\r[-] Trying again' + c)
			sys.stdout.flush()
			time.sleep(0.7)
			clearScr()



def fetchMine():
		global done, stop


		# Define threads
		t = threading.Thread(target=loadingAnim)
		t2 = threading.Thread(target=tryingAgain)
		t2Active = False
		

		while True:

			try:
				transactionPool = requests.get(url = transactionPool_URL)
				poolSize        = len(transactionPool.json())
					
				if transactionPool.status_code == 200:

					stop = True
					t2.join()

					if (poolSize > 0):

						print(f'[MSG] Transaction-Pool has been updated! (size: {poolSize})')
						mining_start = time.time()

						# Threading for mining animation
						t.start()

						# Send mine request and stop thread 
						mining = requests.get(url = mineTransactions_URL)
						done = True
												  
						t.join()
						mining_end = time.time()

						if (mining.status_code == 200):
									print("\n[+] Successfully mined block. Time elapsed: " + str(mining_end - mining_start)[:-12] + " seconds")
			except: 
				if not stop and not t2Active:
					# Threading for `trying again` animation
					t2.start()
					t2Active = True
					

def main():
		clearScr()
		print('[*] Waiting for new transactions')
		fetchMine()

if __name__ == '__main__':
		main()