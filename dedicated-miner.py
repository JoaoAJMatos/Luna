# This script automates the process of mining
import requests
import time
import sys
import threading
import itertools

transactionPool_URL = "http://localhost:3000/api/transaction-pool-map"
mineTransactions_URL = "http://localhost:3000/api/mine-transactions"

def loadingAnim():
          for c in itertools.cycle(['|', '/', '-', '\\']):
                    if done:
                              break
                    sys.stdout.write('\r[+] Mining ' + c)
                    sys.stdout.flush()
                    time.sleep(0.1)
          sys.stdout.write('\r[+] Done!    ')

while True:
          transactionPool = requests.get(url = transactionPool_URL).json()

          if (len(transactionPool) > 0):
                    print('[MESSAGE] Transaction-Pool has been updated!')
                    mining_start = time.time()
                    done = False
                    t = threading.Thread(target=loadingAnim)
                    t.start()
                    mining = requests.get(url = mineTransactions_URL)
                    done = True
                    t.join()
                    mining_end = time.time()
                    print("\n[+] Successfuly mined block. Time elapsed: " + str(mining_end - mining_start) + "ms")
