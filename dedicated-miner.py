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

def loadingAnim():
          for c in itertools.cycle(['|', '/', '-', '\\']):
                    if done:
                              break
                    sys.stdout.write('\r[+] Mining ' + c)
                    sys.stdout.flush()
                    time.sleep(0.1)
          sys.stdout.write('\r[+] Done!    ')

def fetchMine():
          global done

          while True:

                    transactionPool = requests.get(url = transactionPool_URL)
                    poolSize        = len(transactionPool.json())
                    
                    if transactionPool.status_code == 200:

                              if (poolSize > 0):
                                        print(f'[MSG] Transaction-Pool has been updated! (size: {poolSize})')
                                        mining_start = time.time()
                                        # Threading for mining animation
                                        t = threading.Thread(target=loadingAnim)
                                        t.start()
                                        # Send mine request and stop thread 
                                        mining = requests.get(url = mineTransactions_URL)
                                        done = True
                                                  
                                        t.join()
                                        mining_end = time.time()
                                        if (mining.status_code == 200):
                                                  print("\n[+] Successfuly mined block. Time elapsed: " + str(mining_end - mining_start)[:-12] + " seconds")
                    

def main():
          print('[*] Waiting for new transactions')
          fetchMine()

if __name__ == '__main__':
          main()